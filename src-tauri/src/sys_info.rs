use serde::Serialize;
use sysinfo::System;

#[derive(Serialize, Clone)]
pub struct MemoryInfo {
    total: u64,
    used: u64,
    free: u64,
    available: u64,
}

#[derive(Serialize, Clone)]
pub struct CpuInfo {
    usage: f32,
    core_count: usize,
    // model name, frequency, etc. could be added here later
}

#[derive(Serialize, Clone)]
pub struct DiskInfo {
    name: String,
    mount_point: String,
    total_space: u64,
    available_space: u64,
    is_removable: bool,
    is_read_only: bool,
    file_system: String,
}

fn build_system() -> System {
    // Initialize a new system info collector
    let mut sys = System::new_all();
    sys.refresh_all();
    sys
}

#[tauri::command]
pub fn get_memory_info() -> MemoryInfo {
    let sys = build_system();

    let total = sys.total_memory();
    let used = sys.used_memory();
    let available = sys.available_memory();
    // "free" on many platforms is just what's available
    let free = available;

    MemoryInfo {
        total,
        used,
        free,
        available,
    }
}

#[tauri::command]
pub fn get_cpu_info() -> CpuInfo {
    let sys = build_system();

    // After refresh_all, cpu_usage is up‑to‑date
    let cpus = sys.cpus();
    let core_count = cpus.len();
    let total_usage: f32 = cpus.iter().map(|c| c.cpu_usage()).sum();
    let avg_usage = if core_count > 0 {
        total_usage / core_count as f32
    } else {
        0.0
    };

    CpuInfo {
        usage: avg_usage,
        core_count,
    }
}

#[tauri::command]
pub fn get_disk_info() -> Vec<DiskInfo> {
    sysinfo::Disks::new_with_refreshed_list()
        .iter()
        .map(|disk| DiskInfo {
            name: disk.name().to_string_lossy().into_owned(),
            mount_point: disk.mount_point().to_string_lossy().into_owned(),
            total_space: disk.total_space(),
            available_space: disk.available_space(),
            is_removable: disk.is_removable(),
            is_read_only: false,
            file_system: disk.file_system().to_string_lossy().into_owned(),
        })
        .collect()
}
