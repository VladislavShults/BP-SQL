export class QueryUserDto {
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
}
