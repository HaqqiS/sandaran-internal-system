export interface DummyUser {
  id: string;
  name: string;
  email: string;
  roleGlobal: "USER" | "ADMIN" | "EXECUTIVE";
  isActive: boolean;
}

export const DUMMY_USERS: DummyUser[] = [
  {
    id: "user_mandor_1",
    name: "Budi Santoso",
    email: "budi.santoso@astalokadesign.com",
    roleGlobal: "USER",
    isActive: true,
  },
  {
    id: "user_mandor_2",
    name: "Joko Susilo",
    email: "joko.susilo@astalokadesign.com",
    roleGlobal: "USER",
    isActive: true,
  },
];
