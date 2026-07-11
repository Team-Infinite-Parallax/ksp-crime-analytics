const catalyst = require('zcatalyst-sdk-node');
const url = require('url');
const { requireAuth } = require('./authMiddleware');

/**
 * Behavioral Clustering API Handler
 * 
 * K-means clustering for offender behavioral profiling
 * Creates 4-5 offender typologies based on feature vectors
 * 
 * Endpoints:
 * GET /clustering?type=offender     -> Get offender clusters
 * GET /clustering?type=network      -> Get network communities
 */

module.exports = async (req, res) => {
  const authHandler = requireAuth(['SCRB_ADMIN', 'DISTRICT_OFFICER']);
  
  await authHandler(req, res, async (req, res) => {
    try {
      const app = catalyst.initialize(req);
      const datastore = app.datastore();
      const user = req.user;

      const parsed = url.parse(req.url, true);
      const query = parsed.query || {};
      const clusterType = query.type || 'offender';

      // Build role-based filter
      let filterClause = '';
      if (user.role === 'DISTRICT_OFFICER') {
        const districtId = user.employee?.districtID;
        if (districtId) {
          filterClause = `WHERE cm.DistrictID = ${districtId}`;
        }
      }

      if (clusterType === 'offender') {
        // Fetch offender data with behavioral features
        const offendersData = await datastore.executeCoQLQuery(`
          SELECT 
            a.AccusedID,
            a.Name,
            a.Gender,
            a.Age,
            a.IsRepeatOffender,
            COUNT(DISTINCT cm.CaseID) AS caseCount,
            COUNT(DISTINCT cm.DistrictID) AS districtSpread,
            SUM(CASE WHEN cm.GravityOffenceID = 1 THEN 1 ELSE 0 END) AS heinousCrimes,
            SUM(CASE WHEN ar.ArrestID IS NOT NULL THEN 1 ELSE 0 END) AS arrestCount,
            COUNT(DISTINCT ch.CrimeHeadID) AS crimeTypeCount
          FROM Accused a
          INNER JOIN CaseMaster cm ON a.CaseID = cm.CaseID
          LEFT JOIN CrimeHead ch ON cm.CrimeHeadID = ch.CrimeHeadID
          LEFT JOIN ArrestSurrender ar ON cm.CaseID = ar.CaseID
          ${filterClause}
          GROUP BY a.AccusedID, a.Name, a.Gender, a.Age, a.IsRepeatOffender
          HAVING COUNT(DISTINCT cm.CaseID) >= 2
          ORDER BY caseCount DESC
          LIMIT 200
        `);

        // Create feature vectors for clustering
        const featureVectors = offendersData.map(row => ({
          id: row.AccusedID,
          name: row.Name,
          // Normalized features (0-1)
          frequency: Math.min(Number(row.caseCount) / 20, 1),
          mobility: Math.min(Number(row.districtSpread) / 10, 1),
          severity: Math.min(Number(row.heinousCrimes) / Number(row.caseCount), 1),
          evasion: 1 - (Number(row.arrestCount) / Math.max(Number(row.caseCount), 1)),
          specialization: 1 - Math.min(Number(row.crimeTypeCount) / 10, 1),
          rawData: row
        }));

        // Simple K-means clustering (4 clusters)
        const clusters = performKMeansClustering(featureVectors, 4);

        // Assign typologies based on cluster characteristics
        const typologies = assignTypologies(clusters);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          clusters: clusters,
          typologies: typologies,
          offenderCount: offendersData.length,
          summary: generateClusterSummary(clusters, typologies)
        }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid cluster type' }));

    } catch (err) {
      console.error('Clustering Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message
      }));
    }
  });
};

/**
 * Simple K-means clustering implementation
 */
function performKMeansClustering(vectors, k) {
  const featureKeys = ['frequency', 'mobility', 'severity', 'evasion', 'specialization'];
  
  // Initialize centroids randomly
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.floor(Math.random() * vectors.length);
    centroids.push(
      featureKeys.reduce((acc, key) => {
        acc[key] = vectors[idx][key];
        return acc;
      }, {})
    );
  }

  // K-means iterations
  for (let iter = 0; iter < 10; iter++) {
    // Assign points to nearest centroid
    const clusters = Array(k).fill(null).map(() => []);
    
    vectors.forEach(vector => {
      let minDist = Infinity;
      let bestCluster = 0;
      
      centroids.forEach((centroid, idx) => {
        const dist = euclideanDistance(vector, centroid, featureKeys);
        if (dist < minDist) {
          minDist = dist;
          bestCluster = idx;
        }
      });
      
      clusters[bestCluster].push(vector);
    });

    // Update centroids
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0]; // Handle empty cluster
      
      return featureKeys.reduce((acc, key) => {
        acc[key] = cluster.reduce((sum, v) => sum + v[key], 0) / cluster.length;
        return acc;
      }, {});
    });
  }

  // Final assignment
  const finalClusters = Array(k).fill(null).map(() => []);
  vectors.forEach(vector => {
    let minDist = Infinity;
    let bestCluster = 0;
    
    centroids.forEach((centroid, idx) => {
      const dist = euclideanDistance(vector, centroid, featureKeys);
      if (dist < minDist) {
        minDist = dist;
        bestCluster = idx;
      }
    });
    
    finalClusters[bestCluster].push(vector);
  });

  return finalClusters.map((cluster, idx) => ({
    id: idx,
    members: cluster,
    centroid: centroids[idx],
    size: cluster.length
  }));
}

function euclideanDistance(v1, v2, keys) {
  return Math.sqrt(
    keys.reduce((sum, key) => sum + Math.pow(v1[key] - v2[key], 2), 0)
  );
}

/**
 * Assign behavioral typologies based on cluster profiles
 */
function assignTypologies(clusters) {
  const typologies = {
    0: { name: 'Organized Network', icon: '🕷️', color: '#cc3333', description: 'Coordinated multi-crime syndicate' },
    1: { name: 'Repeat Street Offender', icon: '🚗', color: '#ff9933', description: 'Frequent low-level recurring crimes' },
    2: { name: 'Specialized Professional', icon: '💼', color: '#3399ff', description: 'Focused expertise in specific crime type' },
    3: { name: 'Wandering Opportunist', icon: '🗺️', color: '#66cc33', description: 'Mobile offender across districts' }
  };

  return clusters.map((cluster, idx) => {
    const avgFreq = cluster.members.reduce((sum, m) => sum + m.frequency, 0) / cluster.size;
    const avgSevere = cluster.members.reduce((sum, m) => sum + m.severity, 0) / cluster.size;
    const avgMobility = cluster.members.reduce((sum, m) => sum + m.mobility, 0) / cluster.size;
    const avgSpec = cluster.members.reduce((sum, m) => sum + m.specialization, 0) / cluster.size;

    // Determine typology
    let typology = typologies[idx];
    if (avgSevere > 0.7 && cluster.size >= 5) {
      typology = typologies[0]; // Organized
    } else if (avgFreq > 0.7) {
      typology = typologies[1]; // Repeat
    } else if (avgSpec > 0.7) {
      typology = typologies[2]; // Specialized
    } else if (avgMobility > 0.6) {
      typology = typologies[3]; // Wanderer
    }

    return {
      clusterIdx: idx,
      typology: typology.name,
      icon: typology.icon,
      color: typology.color,
      description: typology.description,
      memberCount: cluster.size,
      characteristics: {
        avgFrequency: (avgFreq * 100).toFixed(0),
        avgSeverity: (avgSevere * 100).toFixed(0),
        avgMobility: (avgMobility * 100).toFixed(0),
        avgSpecialization: (avgSpec * 100).toFixed(0)
      }
    };
  });
}

function generateClusterSummary(clusters, typologies) {
  return typologies.map((type, idx) => ({
    typology: type.typology,
    count: clusters[idx].size,
    percentage: ((clusters[idx].size / clusters.reduce((sum, c) => sum + c.size, 0)) * 100).toFixed(1)
  }));
}
