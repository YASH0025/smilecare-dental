import { portfolioService } from "@/lib/services";
import { crudRoutes } from "@/lib/api/crud";

const { collection } = crudRoutes(portfolioService, (p) => p.published);
export const { GET, POST } = collection;
