import type { PersonResponse } from "@olimp/contracts";
import { apiGet } from "./client";

export const getPersons = ()=>apiGet<PersonResponse[]>('/v1/persons')