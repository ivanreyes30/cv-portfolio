import RepositoryInterface from '@/interfaces/RepositoryInterface'

abstract class Repository<Model> implements RepositoryInterface<Model>
{
    protected model: Model

    public modelInstance (): Model
    {
        return this.model
    }
}

export default Repository