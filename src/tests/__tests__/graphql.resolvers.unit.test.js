const resolvers = require("../../graphql/resolvers/index");
const supplierService = require("../../services/supplier.service");

jest.mock("../../services/supplier.service");

describe("GraphQL Resolvers", () => {
  describe("Query.suppliers", () => {
    it("should return a paginated response of suppliers", async () => {
      const mockSuppliers = [
        { id: 1, name: "Supplier A" },
        { id: 2, name: "Supplier B" },
      ];
      
      const paginatedResponse = {
        data: mockSuppliers,
        meta: {
          total: 2,
          totalPages: 1,
          currentPage: 1
        }
      };

      supplierService.getPaginated.mockResolvedValue(paginatedResponse);

      const result = await resolvers.Query.suppliers(null, { limit: 10, page: 1 }, { user: { role: "Admin" } });
      
      expect(result).toEqual(paginatedResponse);
      expect(supplierService.getPaginated).toHaveBeenCalledWith({
        limit: 10,
        page: 1,
      });
    });
  });

  describe("SalesOrder.salesOrderHistory", () => {
    it("should map salesOrderStatusHistory to salesOrderHistory", () => {
      const mockParent = {
        salesOrderStatusHistory: [{ id: 1, status: "DRAFT" }]
      };
      const result = resolvers.SalesOrder.salesOrderHistory(mockParent);
      expect(result).toEqual([{ id: 1, status: "DRAFT" }]);
    });

    it("should return empty array if salesOrderStatusHistory is undefined", () => {
      const mockParent = {};
      const result = resolvers.SalesOrder.salesOrderHistory(mockParent);
      expect(result).toEqual([]);
    });
  });
});
