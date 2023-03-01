export default interface ModelInterface {
    findById(id: number): Promise<any>,
    findByColumns (params: any): Promise<any>
}