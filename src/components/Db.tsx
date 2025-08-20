import { Dexie } from 'dexie';
import type { Table } from 'dexie';

interface User {
    index?: number;
    username?: string;
    personal_id?: string;
    first_name?: string;
    surname?: string;
    hour_rate?: string;
    total_work_time?: string;
    token?: string;
    code?: string;
}

interface Latest {
    index?: number;
    job?: Job;
    train?: MergedTrain | null; // typ ???
    station?: string | null; // typ ???
    measurements?: MeasurementSave | null; // typ ???
    // other fields
}

interface Station {
    index?: number;
    station?: string;
    // other fields
}

class Database extends Dexie {

    user!: Table<User, number>;
    latest!: Table<Latest, number>;
    station!: Table<Station, number>;

    constructor() {

        super('rubika_datapad');

        this.version(1).stores({
            user: '++index',
            latest: '++index',
            station: '++index',
        });

    }

}

export const db: Database = new Database();

db.open().catch(function(err: unknown): void {

    if(err instanceof Error){

        console.error(err.stack || err.message);

    } else {

        console.error(err);

    }

});

/*
db.version(1).stores({
    user: '++index',
    latest: '++index',
    station: '++index',
});

db.open().catch(function(err: unknown): void {

    if(err instanceof Error){

        console.error(err.stack || err.message);

    } else {

        console.error(err);

    }

});

*/