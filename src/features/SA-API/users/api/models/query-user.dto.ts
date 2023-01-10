export class QueryUserDto {
  banStatus: 'all' | 'banned' | 'notBanned';
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: 'desc' | 'asc';
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
}
