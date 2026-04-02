import axios from "axios";

const API_BASE_URL = "https://logpanel.insurancepolicy4u.com/api/Login";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const fetchDropdownValues = async (fieldData: any) => {
  try {
    const response = await api.post("/GetDistinctValues", fieldData);
    return response.data.colvalues.map((value: any) => ({
      value: value.Colvalue,
      label: value.colvaluesAlias,
    }));
  } catch (error) {
    console.error("Error fetching dropdown values:", error);
    return [];
  }
};

export const fetchDatabaseTables = async (serverName: string, dbName: string) => {
  try {
    const response = await api.post("/LoadDatabaseTables", {
      Userid: localStorage.getItem("username"),
      type: serverName,
      databaseName: dbName,
    });
    return response.data.Tables.map((table: any) => ({
      value: table.Tablename,
      label: table.Tablename,
    }));
  } catch (error) {
    console.error("Error fetching database tables:", error);
    return [];
  }
};

export default api;
