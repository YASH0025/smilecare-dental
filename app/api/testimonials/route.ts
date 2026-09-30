import { testimonialService } from "@/lib/services";
import { crudRoutes } from "@/lib/api/crud";

const { collection } = crudRoutes(testimonialService, (t) => t.status === "APPROVED");
export const { GET, POST } = collection;
