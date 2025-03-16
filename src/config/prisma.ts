import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const generateSlug = (name:any) => slugify(name, { lower: true, strict: true });

const prisma = new PrismaClient().$extends({
  query: {
    category: {
      async create({ args, query }) {
        if (args.data.name) args.data.slug = generateSlug(args.data.name);
        return query(args);
      },
      async update({ args, query }) {
        if (args.data.name) args.data.slug = generateSlug(args.data.name);
        return query(args);
      },
    },
  },
});

export default prisma;
