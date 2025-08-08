"use client";

import { useState, useCallback, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { UploadCloud, FileText, AlertCircle, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadStudents } from '@/app/actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// We expect these headers in the CSV
const EXPECTED_HEADERS = ['name', 'code', 'grade'];

interface ParsedStudent {
    name: string;
    code: string;
    grade: string;
}

export function StudentUpload() {
    const [files, setFiles] = useState<File[]>([]);
    const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        setError(null);
        setParsedData([]);
        setFiles([]);

        if (fileRejections.length > 0) {
            setError('Por favor, sube un único archivo con formato .csv');
            return;
        }

        const file = acceptedFiles[0];
        if (file) {
            setFiles([file]);
            Papa.parse<any>(file, {
                header: true,
                skipEmptyLines: true,
                transformHeader: header => header.trim().toLowerCase(),
                complete: (results) => {
                    const actualHeaders = results.meta.fields || [];
                    const missingHeaders = EXPECTED_HEADERS.filter(h => !actualHeaders.includes(h));

                    if (missingHeaders.length > 0) {
                        setError(`El archivo CSV no es válido. Faltan las columnas: ${missingHeaders.join(', ')}. Por favor, usa la plantilla.`);
                        setFiles([]);
                        return;
                    }
                    
                    // Filter out rows that are completely empty
                    const data = results.data.filter(row => 
                        row.name || row.code || row.grade
                    ).map(row => ({
                        name: row.name?.trim() || '',
                        code: row.code?.trim() || '',
                        grade: row.grade?.trim() || '',
                    }));

                    if(data.length === 0){
                        setError("El archivo CSV está vacío o no contiene datos válidos.");
                        setParsedData([]);
                        return;
                    }

                    setParsedData(data);
                },
                error: (err: any) => {
                    setError(`Error al leer el archivo CSV: ${err.message}`);
                    setFiles([]);
                }
            });
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        multiple: false,
    });

    const handleUpload = () => {
        if (parsedData.length === 0) {
            toast({
                title: "No hay datos para cargar",
                description: "Por favor, selecciona y procesa un archivo CSV válido primero.",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            const result = await uploadStudents(parsedData);
            if (result && result.success) {
                toast({
                    title: "✅ ¡Carga Exitosa!",
                    description: result.message,
                    variant: "default",
                    className: "bg-green-600 text-white border-green-700",
                    duration: 5000,
                });
                setFiles([]);
                setParsedData([]);
            } else {
                toast({
                    title: "❌ ¡Error en la Carga!",
                    description: result?.message || "Ocurrió un error desconocido al cargar el archivo.",
                    variant: "destructive",
                    duration: 5000,
                });
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Carga Masiva de Estudiantes</CardTitle>
                <CardDescription>
                    Sube un archivo CSV con las columnas 'name', 'code' y 'grade' para reemplazar la lista de estudiantes.
                </CardDescription>
                 <Button asChild variant="outline" className="w-fit">
                    <Link href="/plantilla_estudiantes.csv" download>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Plantilla
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    {...getRootProps()}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors",
                        isDragActive && "border-primary bg-primary/10",
                        error && "border-destructive/50"
                    )}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="text-primary">Suelta el archivo aquí...</p>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <UploadCloud className="w-10 h-10 mx-auto mb-2" />
                            <p>Arrastra y suelta un archivo CSV aquí</p>
                            <p className="text-sm">o haz clic para seleccionar</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {files.length > 0 && parsedData.length > 0 && !error && (
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                            <div className='truncate'>
                                <p className="font-semibold truncate">{files[0].name}</p>
                                <p className="text-sm text-muted-foreground">{parsedData.length} estudiantes listos para cargar.</p>
                            </div>
                        </div>
                        <Button onClick={handleUpload} disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                            {isPending ? 'Cargando...' : 'Cargar Estudiantes'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
