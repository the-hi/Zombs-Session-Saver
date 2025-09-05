/**
 * @fileoverview A spatial hash implementation for the Zombs.io ginseng library.
 *
 * @description  This spatial hash uses a sparse set, where each cell only exists
 * if there are entities in it. Note that this is technically a spatial grid
 * since we're using direct cell indexing. This specific implementation
 * is taken from an existing spatial hash of mines in other projects. However,
 * this one is experiencing actual usage so it may replace my original one.
 *
 * Who knows?
 *
 * @version 1.0.0
 * @author BlueLatios
 *
 * @todo None
 */

if (!Set.prototype.isSubsetOf) {
    Set.prototype.isSubsetOf = function(otherSet) {
        for (const elem of this) {
            if (!otherSet.has(elem)) return false;
        }
        return true;
    }; 
}

const SPATIAL_HASH_CONFIG = Object.freeze({
    cellSize: 48,
    width: 24000,
    height: 24000,
    gridSize: 24000 / 48,
});

const SPATIAL_HASH_STATE = Object.seal({
    cells: new Map(), // Map<instanceId, Map<cellId, Set<entityId>>>
    entityPositions: new Map(), // Map<instanceId, Map<entityId, {x, y, size}>>
});

const SpatialHash = Object.freeze({
    /**
     * Creates a new spatial hash instance.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @returns {String|Number} The instanceId that was created.
     */
    spawnInstance(instanceId) {
        if (SPATIAL_HASH_STATE.cells.has(instanceId)) {
            throw new Error(
                `Instance ${instanceId} already exists in spatial hash.`,
            );
        }

        SPATIAL_HASH_STATE.cells.set(instanceId, new Map());
        SPATIAL_HASH_STATE.entityPositions.set(instanceId, new Map());

        return instanceId;
    },

    /**
     * Deletes a spatial hash instance and all its entities.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     */
    deleteInstance(instanceId) {
        if (!SPATIAL_HASH_STATE.cells.has(instanceId)) {
            throw new Error(
                `Instance ${instanceId} does not exist in spatial hash.`,
            );
        }

        SPATIAL_HASH_STATE.cells.delete(instanceId);
        SPATIAL_HASH_STATE.entityPositions.delete(instanceId);
    },

    /**
     * Adds an entity to the spatial hash.
     *
     * The coordinates provided are the entities center point.
     * The size is the bounding box of the entity, we assume it's
     * equal on both dimensions.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @param {Number} entityId - The unique identifier for the entity.
     * @param {Number} x - The x coordinate of the entity's center.
     * @param {Number} y - The y coordinate of the entity's center.
     * @param {Number} radius - The radius of the entity's bounding box.
     */
    addEntity(instanceId, entityId, { x, y }, radius) {
        const cells = this.getCells(instanceId);
        const entityPositions = this.getEntityPositions(instanceId);

        if (entityPositions.has(entityId)) {
            throw new Error(
                `Entity ${entityId} already exists in instance ${instanceId}.`,
            );
        }

        entityPositions.set(entityId, { x, y, radius });

        const cellIds = this.queryCellIndexes(x, y, radius);
        for (const cellId of cellIds) {
            if (!cells.has(cellId)) cells.set(cellId, new Set());
            cells.get(cellId).add(entityId);
        }
    },

    /**
     * Deletes an entity from the spatial hash.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @param {Number} entityId - The unique identifier for the entity.
     */
    deleteEntity(instanceId, entityId) {
        const cells = this.getCells(instanceId);
        const entityPositions = this.getEntityPositions(instanceId);

        if (!entityPositions.has(entityId)) {
            throw new Error(
                `Entity ${entityId} does not exist in instance ${instanceId}.`,
            );
        }

        const { x, y, radius } = entityPositions.get(entityId);
        const cellIds = this.queryCellIndexes(x, y, radius);

        for (const cellId of cellIds) {
            if (cells.has(cellId)) {
                cells.get(cellId).delete(entityId);
                if (cells.get(cellId).size === 0) {
                    cells.delete(cellId);
                }
            }
        }

        entityPositions.delete(entityId);
    },

    /**
     * Updates an entity's position in the spatial hash.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @param {Number} entityId - The unique identifier for the entity.
     * @param {Number} newX - The new x coordinate of the entity's center.
     * @param {Number} newY - The new y coordinate of the entity's center.
     */
    updateEntity(instanceId, entityId, { x: newX, y: newY }) {
        const cells = this.getCells(instanceId);
        const entityPositions = this.getEntityPositions(instanceId);

        if (!entityPositions.has(entityId)) {
            throw new Error(
                `Entity ${entityId} does not exist in instance ${instanceId}.`,
            );
        }

        const { x: oldX, y: oldY, radius } = entityPositions.get(entityId);

        const oldCellIds = this.queryCellIndexes(oldX, oldY, radius);
        const newCellIds = this.queryCellIndexes(newX, newY, radius);

        const oldSet = new Set(oldCellIds);
        const newSet = new Set(newCellIds);
        if (oldSet.size === newSet.size && oldSet.isSubsetOf(newSet)) {
            entityPositions.set(entityId, {
                x: newX,
                y: newY,
                radius,
            });
            return;
        }

        for (const cellId of oldCellIds) {
            if (cells.has(cellId)) {
                cells.get(cellId).delete(entityId);
                if (cells.get(cellId).size === 0) {
                    cells.delete(cellId);
                }
            }
        }

        entityPositions.set(entityId, { x: newX, y: newY, radius });

        for (const cellId of newCellIds) {
            if (!cells.has(cellId)) cells.set(cellId, new Set());
            cells.get(cellId).add(entityId);
        }
    },

    /**
     * Queries for entities within a radius of a point.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @param {Number} x - The x coordinate of the query center.
     * @param {Number} y - The y coordinate of the query center.
     * @param {Number} radius - The query radius.
     * @returns {Array} Array of entity IDs within the radius.
     */
    query(instanceId, { x, y }, radius) {
        const cells = this.getCells(instanceId);
        const cellIds = this.queryCellIndexes(x, y, radius);

        const entities = new Set();
        for (const cellId of cellIds) {
            if (cells.has(cellId)) {
                for (const entityId of cells.get(cellId)) {
                    entities.add(entityId);
                }
            }
        }

        return Array.from(entities);
    },

    /**
     * Finds the closest entity within a radius.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @param {Number} x - The x coordinate of the query center.
     * @param {Number} y - The y coordinate of the query center.
     * @param {Number} radius - The query radius.
     * @returns {Number|null} The closest entity ID or null if none found.
     */
    queryClosest(instanceId, { x, y } , radius) {
        const cells = this.getCells(instanceId);
        const entityPositions = this.getEntityPositions(instanceId);
        const cellIds = this.queryCellIndexes(x, y, radius);

        let closestEntity = null;
        let closestDistance = Infinity;

        for (const cellId of cellIds) {
            if (!cells.has(cellId)) continue;

            for (const entityId of cells.get(cellId)) {
                const { x: entityX, y: entityY } =
                    entityPositions.get(entityId);
                const distance = Math.sqrt(
                    (entityX - x) ** 2 + (entityY - y) ** 2,
                );

                if (distance === 0) continue;

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEntity = entityId;
                }
            }
        }

        return closestEntity;
    },

    /**
     * Queries entities within a radius using a predicate function.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @param {Number} x - The x coordinate.
     * @param {Number} y - The y coordinate.
     * @param {Number} radius - The query radius.
     * @param {Function} predicate - Function to test each entity.
     * @returns {Array} Array of entity IDs that match the predicate.
     */
    queryPredicate(instanceId, { x,y }, radius, predicate) {
        const cells = this.getCells(instanceId);
        const cellIds = this.queryCellIndexes(x, y, radius);

        const entities = new Set();
        for (const cellId of cellIds) {
            if (cells.has(cellId)) {
                for (const entityId of cells.get(cellId)) {
                    if (!predicate(entityId)) continue;
                    entities.add(entityId);
                }
            }
        }

        return Array.from(entities);
    },

    /**
     * Gets all cell indexes that intersect with a given area.
     *
     * @param {Number} x - The x coordinate of the area center.
     * @param {Number} y - The y coordinate of the area center.
     * @param {Number} radius - The area radius.
     * @returns {Array} Array of cell indexes.
     */
    queryCellIndexes(x, y, radius) {
        const minX = Math.floor((x - radius) / SPATIAL_HASH_CONFIG.cellSize);
        const maxX = Math.floor((x + radius) / SPATIAL_HASH_CONFIG.cellSize);
        const minY = Math.floor((y - radius) / SPATIAL_HASH_CONFIG.cellSize);
        const maxY = Math.floor((y + radius) / SPATIAL_HASH_CONFIG.cellSize);

        const cellIndexes = [];
        for (let cellX = minX; cellX <= maxX; cellX++) {
            for (let cellY = minY; cellY <= maxY; cellY++) {
                if (!this.isCellInBounds(cellX, cellY)) continue;

                const cellIndex = cellX + cellY * this.gridSize;
                cellIndexes.push(cellIndex);
            }
        }

        return cellIndexes;
    },

    /**
     * Checks if any cells in the given area contain entities.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @param {Number} x - The x coordinate of the area center.
     * @param {Number} y - The y coordinate of the area center.
     * @param {Number} radius - The area radius.
     * @returns {Boolean} True if any cells in the area contain entities.
     */
    queryOccupiedCells(instanceId, { x, y }, radius) {
        const cells = this.getCells(instanceId);
        const cellIds = this.queryCellIndexes(x, y, radius);
        for (const cellId of cellIds) {
            if (cells.has(cellId)) return true;
        }
        return false;
    },

    /**
     * Gets all nearby cell indexes around a given area.
     *
     * @param {Number} x - The x coordinate of the area center.
     * @param {Number} y - The y coordinate of the area center.
     * @param {Number} radius - The area radius.
     * @param {Boolean} diagonal - Whether to include diagonal neighbours.
     * @returns {Array} Array of nearby cell indexes (excluding those inside the area).
     */
    queryNearbyCells({ x, y }, radius, diagonal) {
        const cellIndexes = this.queryCellIndexes(x, y, radius);
        const cellSet = new Set(cellIndexes);
        const nearbySet = new Set();

        for (const cellIndex of cellIndexes) {
            const neighbours = this.getNearbyCells(cellIndex, diagonal);
            for (const neighbourIndex of neighbours) {
                if (!cellSet.has(neighbourIndex)) {
                    nearbySet.add(neighbourIndex);
                }
            }
        }

        return Array.from(nearbySet);
    },

    /**
     * Gets the cells map for a given instanceId.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @returns {Map} The cells map for the instance.
     */
    getCells(instanceId) {
        if (!SPATIAL_HASH_STATE.cells.has(instanceId)) {
            throw new Error(
                `Instance ${instanceId} does not exist in spatial hash.`,
            );
        }
        return SPATIAL_HASH_STATE.cells.get(instanceId);
    },

    /**
     * Gets the entity positions map for a given instanceId.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @returns {Map} The entity positions map for the instance.
     */
    getEntityPositions(instanceId) {
        if (!SPATIAL_HASH_STATE.entityPositions.has(instanceId)) {
            throw new Error(
                `Instance ${instanceId} does not exist in spatial hash.`,
            );
        }
        return SPATIAL_HASH_STATE.entityPositions.get(instanceId);
    },

    /**
     * Gets the cell index for given coordinates.
     *
     * @param {Number} x - The x coordinate.
     * @param {Number} y - The y coordinate.
     * @returns {Number} The cell index, or -1 if out of bounds.
     */
    getCellIndex(x, y) {
        const cellX = Math.floor(x / SPATIAL_HASH_CONFIG.cellSize);
        const cellY = Math.floor(y / SPATIAL_HASH_CONFIG.cellSize);

        if (!this.isCellInBounds(cellX, cellY)) return -1;
        return cellX + cellY * this.gridSize;
    },

    /**
     * Gets all entities in a specific cell.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @param {Number} cellIndex - The cell index.
     * @returns {Array} Array of entity IDs in the cell.
     */
    getCellEntities(instanceId, cellIndex) {
        const cells = this.getCells(instanceId);

        if (!cells.has(cellIndex)) {
            return [];
        }
        return Array.from(cells.get(cellIndex));
    },

    /**
     * Gets the neighbouring cell indexes for a given cell.
     *
     * @param {Number} cellIndex - The cell index.
     * @param {Boolean} [includeDiagonals=false] - Whether to include diagonal neighbours.
     * @returns {Array} Array of neighbouring cell indexes (only those in bounds).
     */
    getNearbyCells(cellIndex, includeDiagonals = false) {
        const x = cellIndex % this.gridSize;
        const y = Math.floor(cellIndex / this.gridSize);

        const directions = includeDiagonals
            ? [
                  [-1, -1],
                  [0, -1],
                  [1, -1],
                  [-1, 0],
                  [1, 0],
                  [-1, 1],
                  [0, 1],
                  [1, 1],
              ]
            : [
                  [0, -1], // N
                  [-1, 0], // W
                  [1, 0], // E
                  [0, 1], // S
              ];

        const neighbours = [];

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (!this.isCellInBounds(nx, ny)) continue;

            const neighbourIndex = nx + ny * this.gridSize;
            neighbours.push(neighbourIndex);
        }

        return neighbours;
    },

    /**
     * Checks if a cell at given coordinates is occupied.
     *
     * @param {String|Number} instanceId - The unique identifier for the instance.
     * @param {Number} x - The x coordinate.
     * @param {Number} y - The y coordinate.
     * @returns {Boolean} True if the cell is occupied.
     */
    isCellOccupied(instanceId, { x, y }) {
        const cells = this.getCells(instanceId);
        const cellIndex = this.getCellIndex(x, y);
        if (cellIndex === -1) return false;

        return cells.has(cellIndex) && cells.get(cellIndex).size > 0;
    },
    isCellInBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.gridSize && y < this.gridSize;
    },

    hasEntity(instanceId, entityId) {
        const entityPositions = this.getEntityPositions(instanceId);
        return entityPositions.has(entityId);
    },

    get width() {
        return SPATIAL_HASH_CONFIG.width;
    },
    get height() {
        return SPATIAL_HASH_CONFIG.height;
    },
    get gridSize() {
        return SPATIAL_HASH_CONFIG.gridSize;
    },
});

export default SpatialHash;