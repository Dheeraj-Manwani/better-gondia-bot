"use client";

export const clientMessages = (key: string) => {
  switch (key) {
    case "USER_NOT_FOUND":
      return "Session expired, please enter your info again.";
    case "SERVER_ERROR":
      return "Something went wrong";
  }
};
