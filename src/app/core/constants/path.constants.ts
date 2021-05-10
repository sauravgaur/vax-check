import { join } from "path"

export const BASE_DIR = join(".")
export const APP_PATHS = {
    SNAPSHOT_DIR: join(BASE_DIR, "uploads", "snapshots"),
    SUPPLIMENT_DIR: join(BASE_DIR,"uploads","supliments-docs"),
    VERFICATION_DIR: join(BASE_DIR,"uploads","verification-docs")
}