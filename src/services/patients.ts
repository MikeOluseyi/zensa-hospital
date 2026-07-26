import { api } from "./api";

export async function getPatients() {

  const response =
    await api.get("/patients");

  return response.data;
}