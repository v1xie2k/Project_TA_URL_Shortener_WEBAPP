import { Storage } from '@google-cloud/storage'
import 'dotenv/config'

const projectId = process.env.gcp_project_id

const storage = new Storage({
    projectId,
    keyFilename: './config/gcs-service-acc.json'
})

export const bucket = storage.bucket(process.env.gcs_bucket_name)