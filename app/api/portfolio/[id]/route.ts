import { portfolioService } from "@/lib/services";
import { crudRoutes } from "@/lib/api/crud";

const { item } = crudRoutes(portfolioService, (p) => p.published);
export const { GET, PUT, DELETE } = item;
