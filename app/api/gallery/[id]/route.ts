import { galleryService } from "@/lib/services";
import { crudRoutes } from "@/lib/api/crud";

const { item } = crudRoutes(galleryService, (g) => g.published);
export const { GET, PUT, DELETE } = item;
