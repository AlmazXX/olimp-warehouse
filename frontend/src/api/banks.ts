import type { BankResponse } from "@olimp/contracts";
import { apiGet } from "./client";

export const getBank = (id:number) => apiGet<BankResponse>(`/v1/banks/${id}`)