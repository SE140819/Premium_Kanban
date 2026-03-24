const version = "v1";

export const API_ENDPOINTS = {
  tasks: {
    list: `/${version}/tasks`,
    create: `/${version}/tasks`,
    update: (id: string | number) => `/${version}/tasks/${id}`,
    delete: (id: string | number) => `/${version}/tasks/${id}`,
  },
};
