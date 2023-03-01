import mysql, { Connection } from 'mysql'
import { DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD  } from '@/config/database'
import HttpException from '@/core/HttpException'

import ModelInterface from '@/interfaces/ModelInterface'

abstract class Model implements ModelInterface 
{
    protected connection: Connection
    
    protected table: string

    constructor ()
    {
        this.initializeDatabase()
    }

    private initializeDatabase (): void
    {
        this.connection = mysql.createConnection({
            host: DB_HOST,
            user: DB_USERNAME,
            password: DB_PASSWORD,
            database: DB_DATABASE
        })
        
        this.connection.connect((error) => {
            if (error) throw new HttpException(500, error)
            
            console.log('Successfully Connected to the Database.')
        })
    }

    public async findById (id: number): Promise<any>
    {
        return new Promise((resolve) => {
            this.connection.query(`SELECT * FROM ${this.table} WHERE id = ?`, id, (error, results) => {
                if (error) throw new HttpException(500, error)
                
                return resolve(results)
            })
        })
    }
    
    public async findByColumns (params: any): Promise<any>
    {
        return new Promise((resolve) => {
            this.connection.query(`SELECT * FROM ${this.table} WHERE ?`, params, (error, results) => {
                if (error) throw new HttpException(500, error)
                
                return resolve(results)
            })
        })
    }
}

export default Model