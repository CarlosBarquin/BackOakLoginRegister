
export type Slot = {
  day : number,
  month : number,
  year : number,
  hour : number,
  avaiable : boolean,
  dni : string
  doctor : string
  updatedBy: User
}
export type User = {
  id: string;
  username: string;
  email: string;
  password?: string;
  name: string;
  surname: string;
  token?: string;
};