import dayjs from "dayjs";

interface Meal {
    id: string;
    name: string;
    description: string | null;
    date: Date;
    in_diet: boolean;

    user_id: string;
}

export function getBestSequenceOnDietInDays(meals: Meal[]) {
    let bestSequenceInDays = 0;
    let currentSequenceInDays = 0;

    let currentDay = dayjs(meals[0].date).startOf('date');
    const finalDay = dayjs(meals[0].date).startOf('date');

    let perfectDay = true;

    meals.forEach((meal) => {
        if (perfectDay && !meal.in_diet) {
            perfectDay = false;
            currentSequenceInDays = 0;
        }
        if (!dayjs(meal.date).startOf('date').isSame(currentDay)) {
            currentDay = dayjs(meal.date).startOf('date');
            
            if (perfectDay) {
                currentSequenceInDays++;
            }
            perfectDay = true;
        }
        if (currentSequenceInDays > bestSequenceInDays) {
            bestSequenceInDays = currentSequenceInDays;
        }
    });

    return bestSequenceInDays;
}