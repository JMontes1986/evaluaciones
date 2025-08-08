
"use client";

import { useState, useCallback, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadStudents } from '@/app/actions';
import type { Grade } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StudentUploadProps {
    grades: Grade[];
}

interface ParsedStudent {
    name: string;
    code: string;
    gradeName: string;
}

export function StudentUpload({ grades }: StudentUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        setParsedData([]);
        const file = acceptedFiles[0];
        if (file && file.type === 'text/csv') {
            setFiles([file]);
            Papa.parse<any>(file, {
                header: true,
                skipEmptyLines: true,
                transformHeader: header => header.trim().toLowerCase(),
                complete: (results) => {
                    const requiredHeaders = ['name', 'code', 'grade'];
                    const actualHeaders = results.meta.fields || [];

                    if (!requiredHeaders.every(h => actualHeaders.includes(h))) {
                        setError(`El archivo CSV debe tener las columnas: 'name', 'code', 'grade'.`);
                        setFiles([]);
                        return;
                    }

                    const data = results.data.map(row => ({
                        name: row.name?.trim(),
                        code: row.code?.trim(),
                        gradeName: row.grade?.trim(),
                    }));
                    
                    setParsedData(data);
                },
                error: (err) => {
                    setError(`Error al leer el archivo CSV: ${err.message}`);
                    setFiles([]);
                }
            });
        } else {
            setError('Por favor, sube un archivo CSV válido.');
            setFiles([]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        multiple: false,
    });

    const handleUpload = () => {
        if(parsedData.length === 0) {
            toast({
                title: "No hay datos para cargar",
                description: "Por favor, selecciona y procesa un archivo CSV primero.",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            const result = await uploadStudents(parsedData);
            if (result.success) {
                toast({
                    title: "✅ ¡Carga Exitosa!",
                    description: result.message,
                    variant: "default",
                    className: "bg-green-600 text-white border-green-700",
                });
                setFiles([]);
                setParsedData([]);
            } else {
                 toast({
                    title: "❌ ¡Error en la Carga!",
                    description: result.message || "Ocurrió un error desconocido.",
                    variant: "destructive",
                });
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Carga Masiva de Estudiantes</CardTitle>
                <CardDescription>
                    Sube un archivo CSV con las columnas 'name', 'code', y 'grade'. Esto reemplazará la lista de estudiantes existente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    {...getRootProps()}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors",
                        isDragActive && "border-primary bg-primary/10"
                    )}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="text-primary">Suelta el archivo aquí...</p>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <UploadCloud className="w-10 h-10 mx-auto mb-2" />
                            <p>Arrastra y suelta un archivo CSV aquí, o haz clic para seleccionar</p>
                            <p className="text-xs">(Columnas requeridas: name, code, grade)</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <p>{error}</p>
                    </div>
                )}

                {files.length > 0 && !error && (
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-semibold">{files[0].name}</p>
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
