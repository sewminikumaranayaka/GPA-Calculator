import {
  Document,
  G,
  Line,
  Page,
  Polyline,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';

const colors = {
  amber: '#f2a93b',
  border: '#d8dee8',
  ink: '#18202f',
  mint: '#2fbf9b',
  muted: '#64748b',
  ocean: '#136f8f',
  paper: '#ffffff',
  soft: '#f7f8fb',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.soft,
    color: colors.ink,
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 28,
  },
  header: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingBottom: 12,
  },
  eyebrow: {
    color: colors.ocean,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
  },
  muted: {
    color: colors.muted,
    lineHeight: 1.5,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metric: {
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexGrow: 1,
    padding: 10,
  },
  metricLabel: {
    color: colors.ocean,
    fontSize: 8,
    fontWeight: 700,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  section: {
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flexGrow: 1,
    flexBasis: 0,
  },
  row: {
    borderBottomColor: '#edf1f7',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 6,
  },
  cell: {
    flexGrow: 1,
    flexBasis: 0,
  },
  cellStrong: {
    flexGrow: 1.7,
    flexBasis: 0,
    fontWeight: 700,
  },
  tag: {
    backgroundColor: '#eaf7f4',
    borderRadius: 4,
    color: colors.ocean,
    fontSize: 8,
    fontWeight: 700,
    paddingHorizontal: 5,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },
  listItem: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 5,
  },
  bullet: {
    color: colors.ocean,
    fontWeight: 700,
  },
});

export default function GpaReportPdf({ aiAnalysis, report }) {
  const generatedAt = new Date().toLocaleDateString();
  const fallbackInsights = buildFallbackInsights(report);
  const fallbackRecommendations = buildFallbackRecommendations(report);
  const insights = aiAnalysis?.academicInsights?.length ? aiAnalysis.academicInsights : fallbackInsights;
  const recommendations = aiAnalysis?.studyRecommendations?.length ? aiAnalysis.studyRecommendations : fallbackRecommendations;
  const aiSummary = aiAnalysis?.performanceAnalysis || {
    summary: fallbackInsights[0].insight,
    trend: fallbackInsights[1].insight,
  };

  return (
    <Document title="GPA Intelligence Report">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>GPA Intelligence</Text>
          <Text style={styles.title}>Academic Performance Report</Text>
          <Text style={styles.muted}>Generated {generatedAt} with GPA metrics, charts, course performance, and AI insights.</Text>
        </View>

        <View style={styles.grid}>
          <Metric label="Semester GPA" value={report.gpa.toFixed(2)} helper="Current weighted GPA" />
          <Metric label="Cumulative GPA" value={report.projectedCumulativeGpa.toFixed(2)} helper="Projected cumulative" />
          <Metric label="Credits" value={report.credits.toFixed(1)} helper="Current load" />
          <Metric label="Subjects" value={String(report.completedSubjects)} helper="Included courses" />
        </View>

        <View style={styles.twoColumn}>
          <View style={[styles.section, styles.column]}>
            <Text style={styles.sectionTitle}>GPA Trend Chart</Text>
            <LineChart data={report.trendData} />
          </View>
          <View style={[styles.section, styles.column]}>
            <Text style={styles.sectionTitle}>Subject Performance Chart</Text>
            <BarChart data={report.subjectData} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course GPA Report</Text>
          <View style={styles.row}>
            <Text style={styles.cellStrong}>Course</Text>
            <Text style={styles.cell}>Credits</Text>
            <Text style={styles.cell}>Grade</Text>
            <Text style={styles.cell}>Points</Text>
          </View>
          {report.courses.map((course) => (
            <View key={course.id || course.name} style={styles.row}>
              <Text style={styles.cellStrong}>{course.name}</Text>
              <Text style={styles.cell}>{Number(course.credits).toFixed(1)}</Text>
              <Text style={styles.cell}>{course.grade}</Text>
              <Text style={styles.cell}>{Number(course.gradePoints).toFixed(1)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.twoColumn}>
          <View style={[styles.section, styles.column]}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            <Text style={styles.muted}>{aiSummary.summary}</Text>
            <Text style={[styles.muted, { marginTop: 6 }]}>{aiSummary.trend}</Text>
            {insights.slice(0, 4).map((insight) => (
              <View key={insight.title} style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: 700 }}>{insight.title}</Text>
                <Text style={styles.muted}>{insight.insight}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.section, styles.column]}>
            <Text style={styles.sectionTitle}>Weak Areas and Recommendations</Text>
            {report.weakSubjects.map((subject) => (
              <View key={subject.id || subject.name} style={styles.listItem}>
                <Text style={styles.bullet}>-</Text>
                <Text style={styles.muted}>
                  {subject.name}: {subject.grade} at {Number(subject.gradePoints).toFixed(1)} points
                </Text>
              </View>
            ))}
            {recommendations.slice(0, 4).map((recommendation) => (
              <View key={`${recommendation.subject}-${recommendation.recommendation}`} style={{ marginTop: 7 }}>
                <Text style={styles.tag}>{recommendation.subject}</Text>
                <Text style={[styles.muted, { marginTop: 4 }]}>{recommendation.recommendation}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}

function Metric({ helper, label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.muted}>{helper}</Text>
    </View>
  );
}

function LineChart({ data }) {
  const width = 230;
  const height = 130;
  const padding = 18;
  const semesterPoints = data.map((item, index) => toPoint(item.semesterGpa, index, data.length, width, height, padding));
  const cumulativePoints = data.map((item, index) => toPoint(item.cumulativeGpa, index, data.length, width, height, padding));

  return (
    <Svg width={width} height={height}>
      <Rect x={0} y={0} width={width} height={height} fill="#fbfdff" stroke={colors.border} />
      {[0, 1, 2, 3].map((line) => (
        <Line
          key={line}
          x1={padding}
          x2={width - padding}
          y1={padding + line * 28}
          y2={padding + line * 28}
          stroke="#e6ebf2"
          strokeWidth={1}
        />
      ))}
      <Polyline points={semesterPoints.map(formatPoint).join(' ')} fill="none" stroke={colors.ocean} strokeWidth={2} />
      <Polyline points={cumulativePoints.map(formatPoint).join(' ')} fill="none" stroke={colors.mint} strokeWidth={2} />
      {data.map((item, index) => (
        <Text key={item.term} x={toPoint(0, index, data.length, width, height, padding).x - 10} y={height - 5} fontSize={7} fill={colors.muted}>
          {item.term}
        </Text>
      ))}
    </Svg>
  );
}

function BarChart({ data }) {
  const width = 230;
  const height = 130;
  const padding = 18;
  const availableWidth = width - padding * 2;
  const gap = 8;
  const barWidth = Math.max(12, (availableWidth - gap * (data.length - 1)) / data.length);

  return (
    <Svg width={width} height={height}>
      <Rect x={0} y={0} width={width} height={height} fill="#fbfdff" stroke={colors.border} />
      {data.map((item, index) => {
        const barHeight = ((height - padding * 2) * item.performance) / 4;
        const x = padding + index * (barWidth + gap);
        const y = height - padding - barHeight;

        return (
          <G key={item.fullName}>
            <Rect x={x} y={y} width={barWidth} height={barHeight} fill={colors.ocean} />
            <Text x={x} y={height - 5} fontSize={7} fill={colors.muted}>
              {item.name}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
}

function toPoint(value, index, total, width, height, padding) {
  const x = padding + (index / Math.max(1, total - 1)) * (width - padding * 2);
  const y = height - padding - ((value - 2.5) / 1.5) * (height - padding * 2);

  return {
    x,
    y: Math.min(height - padding, Math.max(padding, y)),
  };
}

function formatPoint(point) {
  return `${point.x},${point.y}`;
}

function buildFallbackInsights(report) {
  const weakest = report.weakSubjects[0];
  const strongest = report.strongestSubject;

  return [
    {
      title: 'GPA standing',
      insight: `The current semester GPA is ${report.gpa.toFixed(2)}, with a projected cumulative GPA of ${report.projectedCumulativeGpa.toFixed(2)}.`,
    },
    {
      title: 'Performance trend',
      insight: strongest
        ? `${strongest.name} is the strongest current subject and can anchor the study strategy.`
        : 'No strongest subject is available yet because the course list is empty.',
    },
    {
      title: 'Focus area',
      insight: weakest
        ? `${weakest.name} has the largest improvement opportunity at ${Number(weakest.gradePoints).toFixed(1)} grade points.`
        : 'No weak subjects were detected from the current course list.',
    },
  ];
}

function buildFallbackRecommendations(report) {
  return report.weakSubjects.map((subject) => ({
    subject: subject.name,
    recommendation: `Prioritize ${subject.name} with targeted practice, error review, and weekly checkpoint revision.`,
  }));
}
