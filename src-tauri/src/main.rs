#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{Connection, Result};
use std::sync::Mutex;
use tauri::State;

struct Database(Mutex<Connection>);

#[tauri::command]
fn init_database(db: State<Database>) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute_batch(include_str!("schema.sql"))
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn get_user_context(db: State<Database>) -> Result<Option<String>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT project_name, vendor_name, pain_point, created_at FROM user_project_context WHERE id = 'active'")
        .map_err(|e| e.to_string())?;
    
    let result = stmt
        .query_row([], |row| {
            Ok(serde_json::json!({
                "projectName": row.get::<_, String>(0)?,
                "vendorName": row.get::<_, String>(1)?,
                "painPoint": row.get::<_, String>(2)?,
                "createdAt": row.get::<_, String>(3)?,
            }).to_string())
        })
        .ok();
    
    Ok(result)
}

#[tauri::command]
fn save_user_context(db: State<Database>, project_name: String, vendor_name: String, pain_point: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT OR REPLACE INTO user_project_context (id, project_name, vendor_name, pain_point, created_at) VALUES ('active', ?1, ?2, ?3, datetime('now'))",
        rusqlite::params![project_name, vendor_name, pain_point],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn get_daily_progress(db: State<Database>, day_num: i32) -> Result<Option<String>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT day_num, reading_completed, discussion_completed, reflection_completed, streak_days, completed_at FROM daily_progress WHERE day_num = ?1")
        .map_err(|e| e.to_string())?;
    
    let result = stmt
        .query_row([day_num], |row| {
            Ok(serde_json::json!({
                "dayNum": row.get::<_, i32>(0)?,
                "readingCompleted": row.get::<_, bool>(1)?,
                "discussionCompleted": row.get::<_, bool>(2)?,
                "reflectionCompleted": row.get::<_, bool>(3)?,
                "streakDays": row.get::<_, i32>(4)?,
                "completedAt": row.get::<_, Option<String>>(5)?,
            }).to_string())
        })
        .ok();
    
    Ok(result)
}

#[tauri::command]
fn update_daily_progress(db: State<Database>, day_num: i32, reading_completed: bool, discussion_completed: bool, reflection_completed: bool) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let completed = reading_completed && discussion_completed && reflection_completed;
    let completed_at = if completed { Some(chrono::Utc::now().to_rfc3339()) } else { None };
    
    conn.execute(
        "INSERT OR REPLACE INTO daily_progress (id, day_num, reading_completed, discussion_completed, reflection_completed, streak_days, completed_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            format!("day-{}", day_num),
            day_num,
            reading_completed,
            discussion_completed,
            reflection_completed,
            if completed { day_num } else { 0 },
            completed_at,
        ],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn save_term_record(db: State<Database>, term_id: String, term_name: String, view_count: i32, bookmarked: bool, mastered: bool) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT OR REPLACE INTO term_learning_record (id, term_id, term_name, view_count, bookmarked, mastered, last_viewed) VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))",
        rusqlite::params![term_id, term_id, term_name, view_count, bookmarked, mastered],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn get_term_records(db: State<Database>) -> Result<String, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT term_id, term_name, view_count, bookmarked, mastered FROM term_learning_record")
        .map_err(|e| e.to_string())?;
    
    let records: Vec<serde_json::Value> = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "termId": row.get::<_, String>(0)?,
                "termName": row.get::<_, String>(1)?,
                "viewCount": row.get::<_, i32>(2)?,
                "bookmarked": row.get::<_, bool>(3)?,
                "mastered": row.get::<_, bool>(4)?,
            }))
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    
    Ok(serde_json::to_string(&records).map_err(|e| e.to_string())?)
}

#[tauri::command]
fn add_chat_message(db: State<Database>, day_num: i32, role: String, content: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    
    conn.execute(
        "INSERT INTO conversation (id, day_num, role, content, created_at) VALUES (?1, ?2, ?3, ?4, datetime('now'))",
        rusqlite::params![id, day_num, role, content],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn get_chat_history(db: State<Database>, day_num: i32) -> Result<String, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, day_num, role, content, created_at FROM conversation WHERE day_num = ?1 ORDER BY created_at ASC")
        .map_err(|e| e.to_string())?;
    
    let messages: Vec<serde_json::Value> = stmt
        .query_map([day_num], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "dayNum": row.get::<_, i32>(1)?,
                "role": row.get::<_, String>(2)?,
                "content": row.get::<_, String>(3)?,
                "createdAt": row.get::<_, String>(4)?,
            }))
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    
    Ok(serde_json::to_string(&messages).map_err(|e| e.to_string())?)
}

#[tauri::command]
fn get_all_daily_progress(db: State<Database>) -> Result<String, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT day_num, reading_completed, discussion_completed, reflection_completed, streak_days, completed_at FROM daily_progress ORDER BY day_num ASC")
        .map_err(|e| e.to_string())?;
    
    let records: Vec<serde_json::Value> = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "dayNum": row.get::<_, i32>(0)?,
                "readingCompleted": row.get::<_, bool>(1)?,
                "discussionCompleted": row.get::<_, bool>(2)?,
                "reflectionCompleted": row.get::<_, bool>(3)?,
                "streakDays": row.get::<_, i32>(4)?,
                "completedAt": row.get::<_, Option<String>>(5)?,
            }))
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    
    Ok(serde_json::to_string(&records).map_err(|e| e.to_string())?)
}

fn main() {
    let db_path = "menwai_shentang.db";
    let conn = Connection::open(db_path).expect("Failed to open database");
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(Database(Mutex::new(conn)))
        .invoke_handler(tauri::generate_handler![
            init_database,
            get_user_context,
            save_user_context,
            get_daily_progress,
            get_all_daily_progress,
            update_daily_progress,
            save_term_record,
            get_term_records,
            add_chat_message,
            get_chat_history,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
