import { connection } from './database';


export class db {
    public table: string = '';
	private connection: any = '';
	public query: string = '';
	public uniqueField: string = '';
	public where: string = '';
	public orderby: string = '';
	public rpp: number =10;
	public page: number = 1;
	public limit: string = '';
	public url: string = '';
	public totalRecords: number = 0;
	constructor() {

	}

    async executeQuery(query: string, params: any[] = []) {
		this.query = query;
		let connectionObj = new connection();
	
		try {
			this.connection = await connectionObj.getConnection();
			if (!this.connection) {
				throw 'Not connected to database.';
			}
	
			let result = await this.connection.query(query, params); // Pass parameters
	
			if (!result) return false;
	
			if (result.command == "INSERT") {
				return this.uniqueField != '' ? result['rows'][0] : result['rowCount'];
			} else if (["UPDATE", "REPLACE", "DELETE"].includes(result.command)) {
				return result['rowCount'];
			} else {
				return result.rows;
			}
		} catch (error) {
			console.error(error);
			return false;
		}
	}
	

    select(table: string, fields: string, where: string, orderby: string, limit: string) {
		let query = 'SELECT ' + fields + ' FROM ' + table + ' ' + where + ' ' + orderby + ' '+ limit;

		return this.executeQuery(query);
	}

    insert(table: string, data: any) {
		let columnsArray: any = new Array();
		let valuesArray: any = new Array();

		for (let key in data) {
			columnsArray.push(key);
			valuesArray.push(data[key]);
		}
		let columns: string = columnsArray.join(',');

		for (let i = 0; i < valuesArray.length; i++) {
			valuesArray[i] = String(valuesArray[i]);
			valuesArray[i] = valuesArray[i].replace(/'/g, "''");
		}
		let values: string = valuesArray.join("','");

		let query = "INSERT INTO " + table + "(" + columns + ") values('" + values + "') RETURNING *";
		return this.executeQuery(query);
	}

    update(table: string, data: any, where: string) {
		let updatestring: string = '';

		for (let key in data) {
			if (updatestring !== '') {
				updatestring += ',';
			}
			if (data[key] == null) {
				updatestring += key + "=''";
			} else {
				data[key] = String(data[key]);
				updatestring += key + "='" + data[key].replace(/'/g, "''") + "'";
			}
		}

		let query = 'UPDATE ' + table + ' SET ' + updatestring + ' ' + where;
		return this.executeQuery(query);
	}

    delete(table: string, where: string) {
		let query = 'DELETE FROM ' + table + ' ' + where;
		return this.executeQuery(query);
	}

    selectRecord(id: number, fields = '*') {
		return this.select(this.table, fields, 'WHERE ' + this.uniqueField + ' = ' + id, this.orderby, this.limit);
	}

    insertRecord(data: any) {
		return this.insert(this.table, data);
	}

	updateRecord(id: number, data: any) {
		return this.update(this.table, data, ' WHERE ' + this.uniqueField + '=' + id);
	}

	deleteRecord(id: number) {
		return this.delete(this.table, ' WHERE ' + this.uniqueField + '=' + id);
	}

    async listRecords(fields = '*') {
		let start = (this.page - 1) * this.rpp;
		//console.log(start)
		let result = await this.select(this.table, fields, this.where, this.orderby, 'LIMIT ' + this.rpp + ' OFFSET ' + start);
		return !result ? [] : result;
	}

    async allRecords(fields = '*') {
		let result = await this.select(this.table, fields, this.where, this.orderby, '');
		return !result ? [] : result;
	}

    async selectCount(table: string, uniqueField: string, where: string) {
		let query: string = 'SELECT count(' + uniqueField + ') as cnt FROM ' + table + ' ' + where;
		let result: any[] = await this.executeQuery(query);
		return result.length > 0 ? result[0].cnt : 0;
	}

    async getTotalPages() {
		this.totalRecords = await this.selectCount(this.table, this.uniqueField, this.where);
		let totalpages: number = Math.ceil(this.totalRecords / this.rpp);
		return totalpages;
	}

}