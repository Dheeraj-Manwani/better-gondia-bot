import prisma from "@/prisma/db";
import { User } from "@/types";

export async function POST(req: Request) {
  const body: User = await req.json(); // <- get the JSON body here

  const existingUser = await prisma.user.findFirst({
    where: {
      mobile: body.mobile,
    },
  });

  if (existingUser) {
    return Response.json(
      { error: "Mobile number already exists" },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      name: body.name,
      mobile: body.mobile,
      address: body.address,
      ward: body.ward,
    },
  });

  console.log("User created successfully", user);

  // console.log(body); // { name: "Dheeraj" }
  console.log("requires receved ", body);
  return Response.json(
    { success: true, message: "Hello World", data: user },
    { status: 200 }
  );
}
