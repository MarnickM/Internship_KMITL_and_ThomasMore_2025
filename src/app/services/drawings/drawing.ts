import { Vector } from "./vector";

export interface Drawing {
    id: string;
    writer_id: string;
    label_id: string;
    topic_id: string;
    vector: Vector;
    description: string;
    created_at: Date;
}