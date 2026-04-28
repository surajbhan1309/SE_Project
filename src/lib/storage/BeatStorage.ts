import type { Beat } from "@/lib/audio/BeatPlayer";

const DB_NAME = "RapBattleDB";
const STORE_NAME = "custom_beats";

export interface StoredBeat extends Omit<Beat, "audioSrc"> {
    audioBlob: Blob;
    createdAt: number;
}

export class BeatStorage {
    private static dbPromise: Promise<IDBDatabase> | null = null;

    private static getDB(): Promise<IDBDatabase> {
        if (this.dbPromise) return this.dbPromise;

        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: "id" });
                }
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });

        return this.dbPromise;
    }

    static async saveBeat(beat: Beat, blob: Blob): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            const storedBeat: StoredBeat = {
                id: beat.id,
                name: beat.name,
                bpm: beat.bpm,
                style: beat.style,
                bars_per_loop: beat.bars_per_loop,
                energy_level: beat.energy_level,
                complexity_level: beat.complexity_level,
                description: beat.description,
                audioBlob: blob,
                createdAt: Date.now()
            };

            const request = store.put(storedBeat);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    static async getAllBeats(): Promise<Beat[]> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const storedBeats = request.result as StoredBeat[];
                // Convert Blobs back to URLs
                const beats: Beat[] = storedBeats.map(sb => ({
                    id: sb.id,
                    name: sb.name,
                    bpm: sb.bpm,
                    style: sb.style,
                    bars_per_loop: sb.bars_per_loop,
                    energy_level: sb.energy_level,
                    complexity_level: sb.complexity_level,
                    description: sb.description,
                    audioSrc: URL.createObjectURL(sb.audioBlob) // Important: Create ephemeral URL
                }));
                // Sort by newest
                resolve(beats.reverse());
            };
            request.onerror = () => reject(request.error);
        });
    }

    static async deleteBeat(id: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
