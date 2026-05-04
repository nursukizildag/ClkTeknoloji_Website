import { onRequestGet as __api_service_lookup_js_onRequestGet } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\service\\lookup.js"
import { onRequestOptions as __api_service_lookup_js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\service\\lookup.js"
import { onRequestDelete as __api_products__id__js_onRequestDelete } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\[id].js"
import { onRequestGet as __api_products__id__js_onRequestGet } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\[id].js"
import { onRequestOptions as __api_products__id__js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\[id].js"
import { onRequestPut as __api_products__id__js_onRequestPut } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\[id].js"
import { onRequestDelete as __api_service__id__js_onRequestDelete } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\service\\[id].js"
import { onRequestOptions as __api_service__id__js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\service\\[id].js"
import { onRequestPut as __api_service__id__js_onRequestPut } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\service\\[id].js"
import { onRequestOptions as __api_login_js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\login.js"
import { onRequestPost as __api_login_js_onRequestPost } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\login.js"
import { onRequestPost as __api_logout_js_onRequestPost } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\logout.js"
import { onRequestGet as __api_products_index_js_onRequestGet } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\index.js"
import { onRequestOptions as __api_products_index_js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\index.js"
import { onRequestPost as __api_products_index_js_onRequestPost } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\products\\index.js"
import { onRequestGet as __api_service_index_js_onRequestGet } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\service\\index.js"
import { onRequestOptions as __api_service_index_js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\service\\index.js"
import { onRequestPost as __api_service_index_js_onRequestPost } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\service\\index.js"
import { onRequestGet as __api_settings_index_js_onRequestGet } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\settings\\index.js"
import { onRequestOptions as __api_settings_index_js_onRequestOptions } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\settings\\index.js"
import { onRequestPut as __api_settings_index_js_onRequestPut } from "D:\\Project\\ClkTeknolojiWeb\\functions\\api\\settings\\index.js"
import { onRequest as __admin__middleware_js_onRequest } from "D:\\Project\\ClkTeknolojiWeb\\functions\\admin\\_middleware.js"

export const routes = [
    {
      routePath: "/api/service/lookup",
      mountPath: "/api/service",
      method: "GET",
      middlewares: [],
      modules: [__api_service_lookup_js_onRequestGet],
    },
  {
      routePath: "/api/service/lookup",
      mountPath: "/api/service",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_service_lookup_js_onRequestOptions],
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
      method: "GET",
      middlewares: [],
      modules: [__api_products__id__js_onRequestGet],
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
      routePath: "/api/service/:id",
      mountPath: "/api/service",
      method: "DELETE",
      middlewares: [],
      modules: [__api_service__id__js_onRequestDelete],
    },
  {
      routePath: "/api/service/:id",
      mountPath: "/api/service",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_service__id__js_onRequestOptions],
    },
  {
      routePath: "/api/service/:id",
      mountPath: "/api/service",
      method: "PUT",
      middlewares: [],
      modules: [__api_service__id__js_onRequestPut],
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
      routePath: "/api/service",
      mountPath: "/api/service",
      method: "GET",
      middlewares: [],
      modules: [__api_service_index_js_onRequestGet],
    },
  {
      routePath: "/api/service",
      mountPath: "/api/service",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_service_index_js_onRequestOptions],
    },
  {
      routePath: "/api/service",
      mountPath: "/api/service",
      method: "POST",
      middlewares: [],
      modules: [__api_service_index_js_onRequestPost],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api/settings",
      method: "GET",
      middlewares: [],
      modules: [__api_settings_index_js_onRequestGet],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api/settings",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_settings_index_js_onRequestOptions],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api/settings",
      method: "PUT",
      middlewares: [],
      modules: [__api_settings_index_js_onRequestPut],
    },
  {
      routePath: "/admin",
      mountPath: "/admin",
      method: "",
      middlewares: [__admin__middleware_js_onRequest],
      modules: [],
    },
  ]