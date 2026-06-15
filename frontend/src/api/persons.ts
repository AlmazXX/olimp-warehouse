import type { PersonResponse } from "@olipm/contracts";
import { apiGet } from "./client";

export const getPersons = ()=>apiGet<PersonResponse[]>('/v1/persons')