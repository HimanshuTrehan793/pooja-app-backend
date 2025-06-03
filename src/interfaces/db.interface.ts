export type Env = "development";

export interface DBConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: "postgres";
  logging: boolean;
}
