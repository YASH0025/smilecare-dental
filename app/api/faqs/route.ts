import { faqService } from "@/lib/services";
import { crudRoutes } from "@/lib/api/crud";

const { collection } = crudRoutes(faqService, (f) => f.published);
export const { GET, POST } = collection;
