import { Router } from 'express'

export default interface RouteInterface {
    path: string,
    router: Router
}