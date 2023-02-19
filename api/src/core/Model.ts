import mysql, { Connection } from 'mysql'
import { DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD  } from '@/config/database'
import ModelInterface from '@/interfaces/ModelInterface'

abstract class Model implements ModelInterface 
{
    protected database: Connection
    
    protected table: string

    constructor ()
    {
        this.initializeDatabase()
    }

    private initializeDatabase (): void
    {
        this.database = mysql.createConnection({
            host: DB_HOST,
            user: DB_USERNAME,
            password: DB_PASSWORD,
            database: DB_DATABASE
        })
        
        this.database.connect((error) => {
            if (error) throw error
            console.log('Successfully Connected to the Database.')
        })
    }

    public findById (id: number): Promise<ModelInterface>
    {
        return new Promise((resolve, reject) => {
            this.database.query(`SELECT * FROM ${this.table} WHERE id = ?`, id, (error, results) => {
                if (error) throw reject(error)
                
                resolve(results)
            })
        })
    }
}

export default Model