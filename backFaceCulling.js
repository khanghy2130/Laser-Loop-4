// Function to calculate cross product of two vectors
function crossProduct(v1, v2) {
    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];
}

// Function to calculate dot product of two vectors
function dotProduct(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

// Function to subtract two vectors
function subtract(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

// Main function to determine if the triangle is facing the canvas (positive z-axis)
function isFacingCanvas(vertices) {
    const [v0, v1, v2] = vertices;

    // Calculate two edges of the triangle
    const edge1 = subtract(v1, v0);
    const edge2 = subtract(v2, v0);

    // Calculate the normal vector of the triangle
    const normal = crossProduct(edge1, edge2);

    // The view vector for the canvas looking along the positive z-axis
    const viewVector = [0, 0, 1];

    // Calculate the dot product between the normal and the view vector
    const dot = dotProduct(normal, viewVector);

    // If the dot product is less than 0, the triangle is facing the canvas
    return dot > 0;
}