import { onRequestDelete as __api_announcements__id__js_onRequestDelete } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\announcements\\[id].js"
import { onRequestDelete as __api_carousel__id__js_onRequestDelete } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\carousel\\[id].js"
import { onRequestOptions as __api_carousel__id__js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\carousel\\[id].js"
import { onRequestDelete as __api_gallery__id__js_onRequestDelete } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\gallery\\[id].js"
import { onRequestDelete as __api_products__id__js_onRequestDelete } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\[id].js"
import { onRequestOptions as __api_products__id__js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\[id].js"
import { onRequestPut as __api_products__id__js_onRequestPut } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\[id].js"
import { onRequestGet as __api_announcements_index_js_onRequestGet } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\announcements\\index.js"
import { onRequestPost as __api_announcements_index_js_onRequestPost } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\announcements\\index.js"
import { onRequestGet as __api_carousel_index_js_onRequestGet } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\carousel\\index.js"
import { onRequestOptions as __api_carousel_index_js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\carousel\\index.js"
import { onRequestPost as __api_carousel_index_js_onRequestPost } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\carousel\\index.js"
import { onRequestGet as __api_gallery_index_js_onRequestGet } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\gallery\\index.js"
import { onRequestPost as __api_gallery_index_js_onRequestPost } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\gallery\\index.js"
import { onRequestGet as __api_login_js_onRequestGet } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\login.js"
import { onRequestOptions as __api_login_js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\login.js"
import { onRequestPost as __api_login_js_onRequestPost } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\login.js"
import { onRequestPost as __api_logout_js_onRequestPost } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\logout.js"
import { onRequestGet as __api_products_index_js_onRequestGet } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\index.js"
import { onRequestOptions as __api_products_index_js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\index.js"
import { onRequestPost as __api_products_index_js_onRequestPost } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\index.js"
import { onRequest as __admin__middleware_js_onRequest } from "D:\\Project\\ClkTeknolojiWeb\\functions\\admin\\_middleware.js"

export const routes = [
    {
      routePath: "/api/announcements/:id",
      mountPath: "/api/announcements",
      method: "DELETE",
      middlewares: [],
      modules: [__api_announcements__id__js_onRequestDelete],
    },
  {
      routePath: "/api/carousel/:id",
      mountPath: "/api/carousel",
      method: "DELETE",
      middlewares: [],
      modules: [__api_carousel__id__js_onRequestDelete],
    },
  {
      routePath: "/api/carousel/:id",
      mountPath: "/api/carousel",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_carousel__id__js_onRequestOptions],
    },
  {
      routePath: "/api/gallery/:id",
      mountPath: "/api/gallery",
      method: "DELETE",
      middlewares: [],
      modules: [__api_gallery__id__js_onRequestDelete],
    },
  {
      routePath: "/api/products/:id",
      mountPath: "/api/products",
      method: "DELETE",
      middlewares: [],
      modules: [__api_products__id__js_onRequestDelete],
    },
  {
      routePath: "/api/products/:id",
      mountPath: "/api/products",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_products__id__js_onRequestOptions],
    },
  {
      routePath: "/api/products/:id",
      mountPath: "/api/products",
      method: "PUT",
      middlewares: [],
      modules: [__api_products__id__js_onRequestPut],
    },
  {
      routePath: "/api/announcements",
      mountPath: "/api/announcements",
      method: "GET",
      middlewares: [],
      modules: [__api_announcements_index_js_onRequestGet],
    },
  {
      routePath: "/api/announcements",
      mountPath: "/api/announcements",
      method: "POST",
      middlewares: [],
      modules: [__api_announcements_index_js_onRequestPost],
    },
  {
      routePath: "/api/carousel",
      mountPath: "/api/carousel",
      method: "GET",
      middlewares: [],
      modules: [__api_carousel_index_js_onRequestGet],
    },
  {
      routePath: "/api/carousel",
      mountPath: "/api/carousel",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_carousel_index_js_onRequestOptions],
    },
  {
      routePath: "/api/carousel",
      mountPath: "/api/carousel",
      method: "POST",
      middlewares: [],
      modules: [__api_carousel_index_js_onRequestPost],
    },
  {
      routePath: "/api/gallery",
      mountPath: "/api/gallery",
      method: "GET",
      middlewares: [],
      modules: [__api_gallery_index_js_onRequestGet],
    },
  {
      routePath: "/api/gallery",
      mountPath: "/api/gallery",
      method: "POST",
      middlewares: [],
      modules: [__api_gallery_index_js_onRequestPost],
    },
  {
      routePath: "/api/login",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_login_js_onRequestGet],
    },
  {
      routePath: "/api/login",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_login_js_onRequestOptions],
    },
  {
      routePath: "/api/login",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_login_js_onRequestPost],
    },
  {
      routePath: "/api/logout",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_logout_js_onRequestPost],
    },
  {
      routePath: "/api/products",
      mountPath: "/api/products",
      method: "GET",
      middlewares: [],
      modules: [__api_products_index_js_onRequestGet],
    },
  {
      routePath: "/api/products",
      mountPath: "/api/products",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_products_index_js_onRequestOptions],
    },
  {
      routePath: "/api/products",
      mountPath: "/api/products",
      method: "POST",
      middlewares: [],
      modules: [__api_products_index_js_onRequestPost],
    },
  {
      routePath: "/admin",
      mountPath: "/admin",
      method: "",
      middlewares: [__admin__middleware_js_onRequest],
      modules: [],
    },
  ]