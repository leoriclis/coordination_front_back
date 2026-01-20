export const COMPANIES_QUERY = `
  query Companies {
    company(order_by: { id: asc }) {
      id
      name
      created_at
      updated_at
    }
  }
`;

export const PRODUCTS_QUERY = `
  query Products {
    product(order_by: { id: asc }) {
      id
      name
      comment
      quantity
      company_id
      company {
        id
        name
      }
    }
  }
`;

export const PRODUCTS_SUBSCRIPTION = `
  subscription ProductsLive {
    product(order_by: { id: asc }) {
      id
      name
      comment
      quantity
      company_id
      company {
        id
        name
      }
    }
  }
`;
