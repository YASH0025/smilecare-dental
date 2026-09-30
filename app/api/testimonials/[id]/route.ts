import { testimonialService } from "@/lib/services";
import { crudRoutes } from "@/lib/api/crud";

const { item } = crudRoutes(testimonialService, (t) => t.status === "APPROVED");
export const { GET, PUT, DELETE } = item;
