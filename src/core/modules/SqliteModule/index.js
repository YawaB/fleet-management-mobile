import SQLite, { openDatabase } from "react-native-sqlite-storage";

export class SQLiteModule {
  configs = {
    name: "sqlitedb",
    version: "1.1",
    size: 100 * 1024 * 1024,
    description: "sqlite db",
    userSql: `
           CREATE TABLE IF NOT EXISTS LocalUser(
                id integer primary key autoincrement,
                login nvarchar(50) unique,
                password nvarchar(50),
                active integer,
                app nvarchar(50),
                num_1 integer,
                num_2 integer,
                num_3 integer,
                text_1 nvarchar(50),
                text_2 nvarchar(50),
                text_3 nvarchar(50)
            )
        `,
    create_user_table: true,
    debug: true,
  };

  user_table_creation_response = null;
  db = null;
  isInit = false;
  constructor(configs) {
    Object.assign(this.configs, configs || {});
  }
  async init(configs) {
    return new Promise(async (resolve, reject) => {
      try {
        this.isInit = false;
        Object.assign(this.configs, configs || {});

        this.db = await SQLite.openDatabase({
          name: this.configs.name || "sqlitedb.db",
          displayName: this.configs.displayName || "sqlitedb",
          size: this.configs.size,
          version: this.configs.version,
          ...(this.configs.extra_options || {}),
        });

        this.isInit = this.db != null;
        if (this.db && this.configs.userSql && this.configs.create_user_table) {
          console.log("creatig user table");
          this.user_table_creation_response = await this.execSQL(
            this.configs.userSql
          );
          console.log("End creating sql");
        }
        resolve({ db: this.db, usertable: this.user_table_creation_response });
      } catch (e) {
        this.isInit = false;
        console.log("error initializing sqlite database:", e.message);
        resolve({ db: null, error: e.message });
      }
    });
  }
  isDefaultUserTable() {
    return this.user_table_creation_response?.success;
  }

  getDefaultUserTableResponse() {
    return this.user_table_creation_response;
  }
  onDbSuccess(db) {
    this.isInit = db != null;
    this.db = db;
  }
  execSQL(sql, params = []) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!Array.isArray(params)) params = [];
        if (!this.db) await this.init();

        if (this.db == null)
          throw new Error("[ERROR]:Database not initialized");
        let debug = this.configs.debug;
        this.db.transaction(function (tx) {
          tx.executeSql(
            sql,
            params,
            function (t, result) {
              let { rowsAffected, rows, insertId, insertedId } = result;
              let error = null;
              let list = [];
              try {
                if (debug) console.log("execSQL :  success", sql);
                list = typeof rows?.raw == "function" ? rows?.raw() : [];
              } catch (e) {
                console.log("error:", e.message);
                error = e.message;
              }

              resolve({
                success: true,
                rowsAffected,
                insertId,
                response: list,
                insertedId,
                error,
              });
            },
            function (error) {
              console.log("error:", error.message);
              resolve({ success: false, response: error?.message });
            }
          );
        });
      } catch (e) {
        console.log("eee:", e.message);
        resolve({ success: false, response: e.message });
      }
    });
  }

  async _execSQL(sql, params = []) {
    if (!Array.isArray(params)) params = [];
    let success = false;
    let response = null;
    let rowAffected = 0;

    try {
      if (!this.db) this.init();
      if (this.db == null) throw new Error("[ERROR]:Database not initialized");
      await this.db.transactionAsync(async (tx) => {
        try {
          let result = await tx.executeSqlAsync(sql, params);
          // if (this.configs.debug) console.log("execSQL :  success", sql);
          response = result.rows;
          rowAffected = result.rowsAffected;
          success = true;
        } catch (e) {
          response = e.message;
        }
      });
    } catch (e) {
      response = e.message;
    } finally {
      return { success, response, rowAffected };
    }
  }

  async getTables() {
    return await this.select("sqlite_schema", { type: "table" });
  }
  async getSyncTable() {
    return await this.select("sqlite_schema", { type: "table" });
  }
  async dropTable(tableName) {
    try {
      if (tableName) return await this.execSQL("drop table " + tableName);
      throw new Error(`Your table has empty value`);
    } catch (e) {
      return { success: false, result: e.message };
    }
  }

  async clearTable(tableName) {
    try {
      return await this.execSQL("delete  from " + tableName);
    } catch (e) {
      return { success: false, result: e.message };
    }
  }

  async updateLocalUser(data) {
    try {
      let users = this.select("LocalUser");
      if (users?.length > 0) {
        let user = users[0];
        data = { ...user, ...data, id: user.id };
      }
      await this.clearTable("LocalUser");
      return await this.insert("LocalUser", data);
    } catch (e) {
      return { success: false, result: e.message };
    }
  }

  async getLocalUser() {
    try {
      let users = await this.select("LocalUser");
      users = users?.response || [];
      console.log("users:", users);
      if (Array.isArray(users) && users?.length > 0) {
        let user = users[0];
        return { success: true, response: user };
      }
      return { success: false, response: null };
    } catch (e) {
      return { success: false, response: e.message };
    }
  }

  async insert(table, data = []) {
    try {
      data = Array.isArray(data) ? data : [data];

      let output = [];
      for (let obj of data) {
        try {
          let keys = Object.keys(obj);
          if (keys?.length == 0) {
            output.push({ success: false, response: "No data specified !!!" });
            return;
          }

          let valTab = [];
          for (let key of keys) {
            let _val = typeof obj[key] == "string" ? `'${obj[key]}'` : obj[key];

            valTab.push(_val);
          }
          let columns = "(" + keys.join(",") + ")";
          let values = "(" + valTab.join(",") + ")";
          let sql = "insert into " + table + columns + " values " + values;
          let sqlRes = await this.execSQL(sql);
          output.push(sqlRes);
        } catch (err) {
          output.push({ success: false, response: err.message });
        }
      }
      return output;
    } catch (e) {
      return { success: false, result: e.message };
    }
  }

  async bulkInsert(table, data) {
    try {
      data = Array.isArray(data) ? data : [];
      if (data?.length == 0)
        return { success: false, response: "No data to insert" };
      let keys = data.reduce((c, val) => {
        let _keys = Object.keys(val);
        for (let key of _keys) {
          if (!c.includes(key)) c.push(key);
        }
        return c;
      }, []);

      if (keys.length == 0) {
        return { success: false, response: "Data with empty value" };
      }

      let valTab = [];
      for (let obj of data) {
        let values = keys.map((key) =>
          obj[key] === undefined
            ? "null"
            : typeof obj[key] == "string"
            ? `'${obj[key]}'`
            : obj[key]
        );

        valTab.push(`(${values.join(",")})`);
      }
      let columns = `(${keys.join(",")})`;
      let values = valTab.join(",");
      let sql = "insert into " + table + columns + " values " + values;
      return await this.execSQL(sql);
    } catch (e) {
      console.log("errorr:", e.message);
      return { success: false, response: e.message };
    }
  }

  async delete(table, obj = {}, operator = "and") {
    try {
      let keys = Object.keys(obj);
      if (keys?.length == 0) throw new Error("No data specified !!!");

      let valTab = [];
      for (let key of keys) {
        let _val = typeof obj[key] == "string" ? `'${obj[key]}'` : obj[key];

        valTab.push(key + " = " + _val);
      }

      let criteria = valTab.join(` ${operator} `);

      let sql = "delete from  " + table + " where " + criteria;

      let res = await this.execSQL(sql, "D");

      return res;
    } catch (e) {
      return { success: false, response: e.message };
    }
  }

  async update(table, criterias = {}, obj = {}) {
    try {
      let valKeys = Object.keys(obj);
      let criteriKeys = Object.keys(criterias);
      if (valKeys?.length == 0) throw "No data specified !!!";

      let valTab = [];
      for (let key of valKeys) {
        let _val = typeof obj[key] == "string" ? `"${obj[key]}"` : obj[key];

        valTab.push(key + " = " + _val);
      }

      let criteriaTab = [];
      for (let key of criteriKeys) {
        let _val =
          typeof criterias[key] == "string"
            ? `"${criterias[key]}"`
            : criterias[key];
        criteriaTab.push(key + " = " + _val);
      }

      let vals = valTab.join(",");

      let criteria = criteriaTab.join(" and ");

      let sql = "update " + table + " set " + vals;

      if (criteria) sql += " where " + criteria;
      let res = await this.execSQL(sql);

      return res;
    } catch (e) {
      return { success: false, response: e.message };
    }
  }

  async select(table, obj = {}, options) {
    let comparaison = options?.comparaison || "=";
    let operator = options?.operator || "and";
    let order = options?.order || [];
    order = order.map((o) => o.split(":").join(" ")).join(" ");
    if (order?.length > 0) {
      order = " order by " + order;
    }
    let columns = (options?.columns || ["*"])
      .map((o) => o.split(":").join(" "))
      .join(",");
    try {
      if (obj == undefined || typeof obj != "object") obj = {};

      let keys = Object.keys(obj);
      let valTab = [];
      for (let key of keys) {
        let _val = typeof obj[key] == "string" ? `'${obj[key]}'` : obj[key];

        valTab.push(key + ` ${comparaison} ` + _val);
      }

      let criteria = valTab.join(` ${operator} `);

      let sql =
        `select ${options?.countOnly ? "count(*) count" : columns} from  ` +
        table;
      if (criteria != "") sql += " where " + criteria;
      if (order) sql += order;

      let res = await this.execSQL(sql);

      return res;
    } catch (e) {
      return { success: false, response: e.message };
    }
  }

  async count(table, filter) {
    try {
      let response = await this.select(table, filter || {}, {
        countOnly: true,
      });
      console.log("response:", response);
    } catch (e) {}
  }
}

export default new SQLiteModule();
