import fs from 'node:fs';
import path from 'node:path';
export const contentRoot = path.join(process.cwd(), 'content');
export function readJson(name) { return JSON.parse(fs.readFileSync(path.join(contentRoot, `${name}.json`), 'utf8')); }
export function readCollection(name) {
  const folder = path.join(contentRoot, name);
  const defaults = name === 'events' ? { start:'',end:'',location:'',cover:'',coverAlt:'',gallery:[],registrationUrl:'',instagramUrl:'',instagramPosts:[],recap:'',attendance:null,fundraising:null,results:'' } : {url:'',expiresAt:''};
  return fs.readdirSync(folder).filter(f => f.endsWith('.json')).sort().map(file => {const data=JSON.parse(fs.readFileSync(path.join(folder,file), 'utf8')); return {...defaults,...Object.fromEntries(Object.entries(data).filter(([,v])=>v!==null)),slug:file.slice(0,-5)};});
}
export const site = readJson('site');
export const events = readCollection('events').filter(e => e.status !== 'draft');
export const announcements = readCollection('announcements');
export const social = readJson('social');
export const links = readJson('links');
export const team = readJson('team');
