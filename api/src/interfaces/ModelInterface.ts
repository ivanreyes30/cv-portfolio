export default interface ModelInterface {
    findById(id: number): Promise<ModelInterface>
}