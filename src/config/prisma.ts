import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import bcrypt from "bcrypt";
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
    user: {
      async create({ args, query }) {
        if (args.data.password) {
          args.data.password = await bcrypt.hash(args.data.password, 12);
        }
        return query(args);
      },

      async update({ args, query }) {
        if (args.data.password && typeof args.data.password === 'string') {
          const hashedPassword = await bcrypt.hash(args.data.password, 12);
          args.data.password = hashedPassword;
        }
        return query(args);
      },
    },
  },
});

export default prisma;
