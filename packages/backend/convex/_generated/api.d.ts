/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as comments from "../comments.js";
import type * as departments from "../departments.js";
import type * as groups from "../groups.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as posts from "../posts.js";
import type * as privateData from "../privateData.js";
import type * as quizzes from "../quizzes.js";
import type * as reactions from "../reactions.js";
import type * as seed from "../seed.js";
import type * as streaks from "../streaks.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  comments: typeof comments;
  departments: typeof departments;
  groups: typeof groups;
  healthCheck: typeof healthCheck;
  http: typeof http;
  messages: typeof messages;
  notifications: typeof notifications;
  posts: typeof posts;
  privateData: typeof privateData;
  quizzes: typeof quizzes;
  reactions: typeof reactions;
  seed: typeof seed;
  streaks: typeof streaks;
  todos: typeof todos;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
