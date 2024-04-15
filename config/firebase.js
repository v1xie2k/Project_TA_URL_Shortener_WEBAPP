import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import 'dotenv/config'
const {privateKey} = JSON.parse(process.env.private_key_firebase) 

const serviceAccount = {
    "type": "service_account",
    "project_id": "tes-firebase-9bd08",
    "private_key_id":  process.env.private_key_id_firebase,
    privateKey,
    "client_email": "firebase-adminsdk-qn55b@tes-firebase-9bd08.iam.gserviceaccount.com",
    "client_id": "103332832864299854457",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-qn55b%40tes-firebase-9bd08.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

export const fire = initializeApp({
    credential: cert(serviceAccount)
});