import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import crypto from 'crypto';

export const uploadsFolder = 'uploads';
export const uploadsJsonPath = `${uploadsFolder}/uploads.json`;
export const COOKIE_EXPIRY_HOURS = 24;
const COOKIE_SECRET = "watr_fii_stan&dascalu_andrei_2025";

export const signUUID = (uuid) => {
  const hmac = crypto.createHmac('sha256', COOKIE_SECRET);
  hmac.update(uuid);
  return hmac.digest('hex');
};

export const verifyUUID = (uuid, signature) => {
  const hmac = crypto.createHmac('sha256', COOKIE_SECRET);
  hmac.update(uuid);
  return hmac.digest('hex') === signature;
};

export const createCookieIfMissing = (req, res) => {
  let uuid = req.cookies['user_uuid'];
  let signature = req.cookies['user_uuid_signature'];

  const uploads = getUploadsData();

  if (!uploads[uuid] || !signature || !verifyUUID(uuid, signature)) {
    uuid = uuidv4();
    signature = signUUID(uuid);

    res.clearCookie('user_uuid');
    res.clearCookie('user_uuid_signature');

    res.cookie('user_uuid', uuid, { httpOnly: true, maxAge: COOKIE_EXPIRY_HOURS * 60 * 60 * 1000 });
    res.cookie('user_uuid_signature', signature, { httpOnly: true, maxAge: COOKIE_EXPIRY_HOURS * 60 * 60 * 1000 });

    updateUploadsJson(uuid, signature);
  } else {
    updateUploadsJson(uuid, signature);
  }

  return uuid;
};

export const updateUploadsJson = (uuid, signature, files = []) => {
  const uploads = getUploadsData();
  uploads[uuid] = {
    timestamp: Date.now(),
    signature: signature,
    files: [...new Set([...(uploads[uuid]?.files || []), ...files])],
  };
  saveUploadsData(uploads);
};

export const ensureUserFolder = (uuid) => {
  const userFolder = path.join(uploadsFolder, uuid);
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder);
  }
  return userFolder;
};

export const getUploadsData = () => {
  if (!fs.existsSync(uploadsJsonPath)) return {};
  return JSON.parse(fs.readFileSync(uploadsJsonPath, 'utf8') || '{}');
};

export const saveUploadsData = (data) => {
  fs.writeFileSync(uploadsJsonPath, JSON.stringify(data, null, 2), 'utf8');
};

export const checkPrerequisites = () => {
  if (!fs.existsSync(uploadsFolder)) fs.mkdirSync(uploadsFolder);
  if (!fs.existsSync(uploadsJsonPath)) saveUploadsData({});

  cron.schedule('0 */6 * * *', () => {
    const uploads = getUploadsData();
    const now = Date.now();
    for (const [uuid, session] of Object.entries(uploads)) {
      if (now - session.timestamp > COOKIE_EXPIRY_HOURS * 60 * 60 * 1000) {
        const userFolder = path.join(uploadsFolder, uuid);
        if (fs.existsSync(userFolder)) fs.rmSync(userFolder, { recursive: true });
        delete uploads[uuid];
      }
    }
    saveUploadsData(uploads);
  });
};
