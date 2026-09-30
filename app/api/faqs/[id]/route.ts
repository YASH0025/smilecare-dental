import { faqService } from "@/lib/services";
import { crudRoutes } from "@/lib/api/crud";

const { item } = crudRoutes(faqService, (f) => f.published);
export const { GET, PUT, DELETE } = item;
