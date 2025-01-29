import fs from 'fs';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import crypto from 'crypto';

const uploadsFolder = 'uploads';
const uploadsJsonPath = `${uploadsFolder}/uploads.json`;
export const COOKIE_EXPIRY_HOURS = 72;
const COOKIE_SECRET = "watr_fii_stan&dascalu_andrei_2025";

export const utilsService = {
    verifyUUID(uuid, signature) {
        const hmac = crypto.createHmac('sha256', COOKIE_SECRET);
        hmac.update(uuid);
        return hmac.digest('hex') === signature;
    },

    createCookieIfMissing(req, res) {
        let uuid = req.cookies['user_uuid'];
        let signature = req.cookies['user_uuid_signature'];

        const uploads = this.getUploadsData();

        if (!uploads[uuid] || !signature || !this.verifyUUID(uuid, signature)) {
            uuid = uuidv4();
            signature = this.signUUID(uuid);

            res.clearCookie('user_uuid');
            res.clearCookie('user_uuid_signature');

            res.cookie('user_uuid', uuid, { httpOnly: true, maxAge: COOKIE_EXPIRY_HOURS * 60 * 60 * 1000 });
            res.cookie('user_uuid_signature', signature, { httpOnly: true, maxAge: COOKIE_EXPIRY_HOURS * 60 * 60 * 1000 });

            this.updateUploadsJson(uuid, signature);
        } else {
            this.updateUploadsJson(uuid, signature);
            res.cookie('user_uuid', uuid, { httpOnly: true, maxAge: COOKIE_EXPIRY_HOURS * 60 * 60 * 1000 });
            res.cookie('user_uuid_signature', signature, { httpOnly: true, maxAge: COOKIE_EXPIRY_HOURS * 60 * 60 * 1000 });
        }

        return uuid;
    },

    updateUploadsJson(uuid, signature, files = []) {
        const uploads = this.getUploadsData();
        uploads[uuid] = {
            timestamp: Date.now(),
            signature: signature,
            files: [...new Set([...(uploads[uuid]?.files || []), ...files])],
        };
        this.saveUploadsData(uploads);
    },

    ensureUserFolder(uuid) {
      const userFolder = path.join(uploadsFolder, uuid);
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder);
      }
      return userFolder;
    },

    checkPrerequisites() {
        if (!fs.existsSync(uploadsFolder)) fs.mkdirSync(uploadsFolder);
        if (!fs.existsSync(uploadsJsonPath)) this.saveUploadsData({});

        this.clearExpiredUsersJson();
        cron.schedule('0 */6 * * *', () => {
            this.clearExpiredUsersJson();
        });
    },

    getUploadsData() {
        if (!fs.existsSync(uploadsJsonPath)) return {};
        return JSON.parse(fs.readFileSync(uploadsJsonPath, 'utf8') || '{}');
    },

    saveUploadsData(data) {
        fs.writeFileSync(uploadsJsonPath, JSON.stringify(data, null, 2), 'utf8');
    },

    signUUID(uuid) {
        const hmac = crypto.createHmac('sha256', COOKIE_SECRET);
        hmac.update(uuid);
        return hmac.digest('hex');
    },

    clearExpiredUsersJson() {
        const uploads = this.getUploadsData();
        const now = Date.now();
        for (const [uuid, session] of Object.entries(uploads)) {
            if (now - session.timestamp > COOKIE_EXPIRY_HOURS * 60 * 60 * 1000) {
                const userFolder = path.join(uploadsFolder, uuid);
                if (fs.existsSync(userFolder)) fs.rmSync(userFolder, { recursive: true });
                delete uploads[uuid];
            }
        }
        this.saveUploadsData(uploads);
    },
}