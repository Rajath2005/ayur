import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, AlertCircle } from "lucide-react";

interface VisualReportCardProps {
    report: {
        summary: string;
        details: string;
        issues?: string[];
        recommendations?: string[];
    };
}

export function VisualReportCard({ report }: VisualReportCardProps) {
    return (
        <Card className="border-primary/20 bg-primary/5 animate-fade-in">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <CardTitle>Drishti Visual Analysis</CardTitle>
                </div>
                <CardDescription>AI-powered visual health assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-1">Summary</h4>
                    <p className="text-sm text-muted-foreground">{report.summary}</p>
                </div>

                {report.details && (
                    <div>
                        <h4 className="font-semibold mb-1">Observations</h4>
                        <p className="text-sm text-muted-foreground">{report.details}</p>
                    </div>
                )}

                {report.issues && report.issues.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">Potential Imbalances</h4>
                        <div className="flex flex-wrap gap-2">
                            {report.issues.map((issue, i) => (
                                <Badge key={i} variant="destructive" className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {issue}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {report.recommendations && report.recommendations.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                            {report.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
